import axios from "axios";

export const submitTest = (algorithm, graphIndex, customFile) => {
  const formData = new FormData();
  formData.append("algorithm", algorithm);
  formData.append("graphIndex", graphIndex);
  if (customFile) formData.append("customGraph", customFile);
  return axios.post("/test", formData);
};

export const fetchResult = (id) => {
  return axios.get("/result", { params: { id } });
};

export const fetchGraphs = () => {
  return axios.get("/api/graphs");
};
