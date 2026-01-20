variable "name" {
  description = "Name of the backend application / Kubernetes Deployment."
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace in which to deploy the backend resources."
  type        = string
}

variable "image" {
  description = "Container image (including tag) to run for the backend service."
  type        = string
}

variable "labels" {
  description = "Additional labels to apply to Kubernetes resources created by this module."
  type        = map(string)
}

variable "container_port" {
  description = "Port number exposed by the application container."
  type        = number
}

variable "service_port" {
  description = "Port number exposed by the Kubernetes Service to clients."
  type        = number
}

variable "service_type" {
  description = "Kubernetes Service type (e.g., ClusterIP, NodePort, LoadBalancer)."
  type        = string
  default     = "ClusterIP"
}

variable "port_name" {
  description = "Name assigned to the service port (used in Kubernetes Service and container ports)."
  type        = string
  default     = "http"
}

variable "replicas" {
  description = "Number of pod replicas to run for the backend Deployment."
  type        = number
  default     = 1
}

variable "cpu_limit" {
  description = "CPU limit for the backend container (Kubernetes quantity, e.g., '500m' or '1')."
  type        = string
  default     = "1"
}

variable "memory_limit" {
  description = "Memory limit for the backend container (Kubernetes quantity, e.g., '256Mi' or '512Mi')."
  type        = string
  default     = "512Mi"
}