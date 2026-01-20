variable "namespace" {
  description = "Kubernetes namespace for deploying services"
  type        = string
  default     = "tsp-solver"
}

variable "image_repository" {
  description = "Base image repository for TSP containers"
  type        = string
  default     = "ghcr.io/jadamsx/containerised-tsp"
}
