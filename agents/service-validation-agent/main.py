"""Service validation agent - KB-only version, AgentCore compatible"""

import uuid
from typing import List, Dict, Any

from bedrock_agentcore.runtime import BedrockAgentCoreApp
from strands import Agent
from starlette.middleware.cors import CORSMiddleware
from strands.models.bedrock import BedrockModel

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

# Create agent with memory handler attached
agent = Agent(
    model=model,
    system_prompt=SYSTEM_PROMPT,
    tools=tools,
)


# ────────────────────────────────────────────────
# HTTP entrypoint (AgentCore style)
# ────────────────────────────────────────────────
@app.entrypoint
async def invoke(payload: Dict, context):
    """AgentCore-compatible entrypoint"""
    user_message = payload.get("prompt") or payload.get("question", "")
    
    if not user_message:
        return {"error": "No prompt or question provided"}
    
    # AgentCore will automatically inject memory via the handler
    result = await agent(user_message, context=context)
    
    return {
        "result": result.message if hasattr(result, 'message') else str(result)
    }


# ────────────────────────────────────────────────
# WebSocket handler - AgentCore compatible
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
                
                await websocket.send_json({
                    "type": "status",
                    "status": "processing",
                    "prompt": user_message
                })
                
                chunk_count = 0
                full_response = ""
                
                # Pass context so memory handler knows which session to use
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
                    "total_chunks": chunk_count
                })
                
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid JSON received"})
            except Exception as e:
                await websocket.send_json({"type": "error", "message": str(e)})
                
    except Exception:
        pass  # silent close


if __name__ == "__main__":
    print("Starting service validation agent (KB-only mode)...")
    print(f"Loaded {len(tools)} tool(s)")
    app.run(port=8082)