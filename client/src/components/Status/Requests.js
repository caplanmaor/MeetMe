export const fetchInitialStatuses = async (token) => {
  const response = await fetch("http://localhost:8000/initial_statuses/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    data.sort((a, b) => a.username.localeCompare(b.username));
    return data;
  } else if (response.status === 401) {
    throw new Error("Unauthorized access");
  } else {
    throw new Error(`Failed to fetch statuses: ${response.status}`);
  }
};

export const updateStatusInDB = async (userID, status, token) => {
  const response = await fetch(
    `http://localhost:8000/update_status/?user_id=${userID}&status=${status}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401) {
    throw new Error("Unauthorized access");
  }
};
