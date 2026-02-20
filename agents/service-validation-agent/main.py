"""Service validation agent - KB-only version, AgentCore compatible"""
from typing import Dict
import uuid
import os

from bedrock_agentcore.runtime import BedrockAgentCoreApp
from strands import Agent
from starlette.middleware.cors import CORSMiddleware
from strands.models.bedrock import BedrockModel

from bedrock_agentcore.memory.integrations.strands.config import AgentCoreMemoryConfig
from bedrock_agentcore.memory.integrations.strands.session_manager import AgentCoreMemorySessionManager

import json

from config import MODEL_ID, SYSTEM_PROMPT
from tools import retrieve_sdp_calibration_kb

app = BedrockAgentCoreApp()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = BedrockModel(model_id=MODEL_ID)
tools = [retrieve_sdp_calibration_kb]

# ────────────────────────────────────────────────
# Memory setup – shared helper
# ────────────────────────────────────────────────

MEMORY_ID = "TestAgentShortTerm-EXe3AaD3nu"

def get_memory_session_manager(session_id: str) -> AgentCoreMemorySessionManager:
    config = AgentCoreMemoryConfig(
        memory_id=MEMORY_ID,
        session_id=session_id,
        actor_id="demo_user" 
    )
    return AgentCoreMemorySessionManager(
        agentcore_memory_config=config,
        region_name="eu-west-1"  
    )

_agent_cache = {}

def get_agent_for_session(session_id: str) -> Agent:
    if session_id not in _agent_cache:
        session_manager = get_memory_session_manager(session_id)
        _agent_cache[session_id] = Agent(
            model=model,
            system_prompt=SYSTEM_PROMPT,
            tools=tools,
            session_manager=session_manager,
        )
    return _agent_cache[session_id]

# ────────────────────────────────────────────────
# HTTP entrypoint
# ────────────────────────────────────────────────
@app.entrypoint
async def invoke(payload: Dict, context):
    """AgentCore-compatible entrypoint"""
    user_message = payload.get("prompt") or payload.get("question", "")
    
    if not user_message:
        return {"error": "No prompt or question provided"}
    
    # Get or generate session_id
    session_id = payload.get("session_id")
    if not session_id:
        session_id = str(uuid.uuid4())
    
    # Get agent with short-term memory for this session
    agent = get_agent_for_session(session_id)
    
    result = await agent(user_message, context=context)
    
    return {
        "result": result.message if hasattr(result, 'message') else str(result),
    }

# ────────────────────────────────────────────────
# WebSocket handler 
# ────────────────────────────────────────────────
@app.websocket
async def websocket_handler(websocket, context):
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                payload = json.loads(data)
                user_message = payload.get("prompt") or payload.get("question", "")
                
                if not user_message:
                    await websocket.send_json({"error": "No prompt provided"})
                    continue
                
                # Get or generate session_id
                session_id = payload.get("session_id")

                if not session_id:
                    session_id = str(uuid.uuid4())
                
                # Inform frontend of the session_id 
                await websocket.send_json({
                    "type": "status",
                    "status": "processing",
                    "prompt": user_message,
                    "session_id": session_id
                })
                
                # Get agent with short-term memory for this session
                agent = get_agent_for_session(session_id)
                
                chunk_count = 0
                full_response = ""
                
                async for event in agent.stream_async(
                    user_message,
                    context=context
                ):
                    text_content = None
                    
                    if isinstance(event, dict) and "event" in event:
                        inner = event["event"]
                        if isinstance(inner, dict) and "contentBlockDelta" in inner:
                            delta_block = inner["contentBlockDelta"]
                            if isinstance(delta_block, dict) and "delta" in delta_block:
                                delta = delta_block["delta"]
                                if isinstance(delta, dict) and "text" in delta:
                                    text_content = delta["text"]
                    
                    if text_content and text_content.strip():
                        full_response += text_content
                        chunk_count += 1
                        await websocket.send_json({
                            "type": "chunk",
                            "content": text_content,
                            "chunk_number": chunk_count
                        })
                
                # Completion
                await websocket.send_json({
                    "type": "complete",
                    "total_chunks": chunk_count,
                    "session_id": session_id
                })
                
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid JSON received"})
            except Exception as e:
                await websocket.send_json({"type": "error", "message": str(e)})
                
    except Exception:
        pass  # silent close

if __name__ == "__main__":
    print("Starting service validation agent (KB-only mode with short-term memory)...")
    print(f"Loaded {len(tools)} tool(s)")
    print(f"Memory ID: {MEMORY_ID}")
    app.run(port=8082)