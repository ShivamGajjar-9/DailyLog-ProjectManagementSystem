export async function fetchTasks(workspaceId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/workspace/${workspaceId}/tasks`, {
    // This ensures the data is fresh
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function fetchMembers(workspaceId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/workspace/${workspaceId}/members`, {
      // This ensures the data is fresh
      cache: 'no-store',
      credentials: 'include', // This is important for sending cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error('Members fetch error:', {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error(
        errorData?.details || 
        errorData?.error || 
        `Failed to fetch members: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
}

export async function fetchChats(workspaceId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/workspace/${workspaceId}/chats`, {
      cache: 'no-store',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error('Chats fetch error:', {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error(
        errorData?.details || 
        errorData?.error || 
        `Failed to fetch chats: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
} 