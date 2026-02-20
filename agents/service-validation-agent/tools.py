"""Tools for service validation agent."""
import boto3
from strands import tool
from config import KB_ID, AWS_REGION 


@tool(
    name="retrieve_sdp_calibration_kb",
    description="Search AWS SDP calibration guidance. Use specific requirement IDs or control names.",
)
def retrieve_sdp_calibration_kb(query: str, top_k: int = 6) -> dict:
    """Retrieve calibration guidance from AWS Knowledge Base.
    
    Args:
        query: Search query (e.g., 'RDS-001 backup requirements')
        top_k: Number of results (default: 6)
    """
    client = boto3.client("bedrock-agent-runtime", region_name=AWS_REGION)
    
    try:
        response = client.retrieve(
            knowledgeBaseId=KB_ID,
            retrievalQuery={"text": query},
            retrievalConfiguration={
                "vectorSearchConfiguration": {"numberOfResults": top_k}
            }
        )
        
        if not response.get("retrievalResults"):
            return {
                "status": "success",
                "content": [{
                    "text": f"No results found for '{query}'. Try different search terms."
                }]
            }
        
        results = []
        for rank, result in enumerate(response["retrievalResults"], start=1):
            content = result.get("content", {}).get("text", "")
            score = result.get("score", 0.0)
            
            s3_location = result.get("location", {}).get("s3Location", {})
            source_uri = s3_location.get("uri", "unknown")
            source_file = source_uri.split("/")[-1] if source_uri else "unknown"
            
            snippet = content[:900].replace("\n", " ") if content else ""
            
            results.append(
                f"[{rank}] Source: {source_file}\n"
                f"Score: {score:.4f}\n"
                f"{snippet}\n"
            )
        
        return {
            "status": "success",
            "content": [{
                "text": "Retrieved calibration excerpts:\n\n" + "\n".join(results)
            }]
        }
        
    except Exception as e:
        return {
            "status": "error",
            "content": [{"text": f"Error querying Knowledge Base: {str(e)}"}]
        }


# # COMMENTED OUT FOR KB-ONLY TESTING
# def get_rovo_tools_from_gateway():
#     """Get Rovo MCP tools through AgentCore Gateway.
#     
#     According to search results, Rovo MCP Server provides:
#     - search: AI-powered search across Jira and Confluence
#     - fetch: Retrieve detailed content from specific resources
#     
#     Returns list of tool definitions that can be used with Strands Agent.
#     """
#     if not GATEWAY_ARN:
#         return []
#     
#     client = boto3.client("bedrock-agentcore", region_name=AWS_REGION)
#     
#     try:
#         # Get gateway configuration
#         response = client.get_gateway(gatewayArn=GATEWAY_ARN)
#         
#         # Extract Rovo MCP target tools
#         targets = response.get("targets", [])
#         rovo_target = None
#         
#         for target in targets:
#             if target.get("targetId") == ROVO_MCP_TARGET_ID:
#                 rovo_target = target
#                 break
#         
#         if not rovo_target:
#             return []
#         
#         # Get available tools from the Rovo MCP target
#         mcp_config = rovo_target.get("mcpTarget", {})
#         available_tools = mcp_config.get("tools", [])
#         
#         # Rovo MCP Server provides these tools (from search results)
#         # We want both search and fetch for comprehensive access
#         allowed_tools = {
#             "search",  # Rovo Search - AI-powered search
#             "fetch",   # Rovo Fetch - Get detailed content
#         }
#         
#         filtered_tools = [
#             tool for tool in available_tools 
#             if tool.get("name") in allowed_tools
#         ]
#         
#         return filtered_tools
#         
#     except Exception as e:
#         print(f"Warning: Could not load Rovo tools from gateway: {e}")
#         return []