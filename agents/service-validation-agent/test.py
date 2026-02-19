"""Test service validation agent locally - KB-only version."""
from main import agent


def test_kb_retrieval():
    """Test basic KB retrieval."""
    query = "What are the backup requirements for RDS-001?"
    
    print(f"Query: {query}\n")
    print("=" * 80)
    
    result = agent(query)
    print(f"\nResponse:\n{result.message}\n")
    print("=" * 80)


def test_multiple_searches():
    """Test agent's ability to refine searches."""
    query = "Find all encryption requirements for database services"
    
    print(f"Query: {query}\n")
    print("=" * 80)
    
    result = agent(query)
    print(f"\nResponse:\n{result.message}\n")
    print("=" * 80)


def test_no_results():
    """Test handling of queries with no results."""
    query = "What are the requirements for FAKE-999?"
    
    print(f"Query: {query}\n")
    print("=" * 80)
    
    result = agent(query)
    print(f"\nResponse:\n{result.message}\n")
    print("=" * 80)


if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("SERVICE VALIDATION AGENT - KB-ONLY TESTING")
    print("=" * 80 + "\n")
    
    print("\n=== Test 1: Basic KB Retrieval ===\n")
    test_kb_retrieval()
    
    print("\n=== Test 2: Multiple Searches ===\n")
    test_multiple_searches()
    
    print("\n=== Test 3: No Results Handling ===\n")
    test_no_results()
