variable "name" {
  type = string
}

variable "namespace" {
  type = string
}

variable "image" {
  type = string
}

variable "labels" {
  type = map(string)
}

variable "master_container_port" {
  type = number
}

variable "master_service_port" {
  type = number
}

variable "worker_replicas" {
  type    = number
  default = 1
}

variable "service_type" {
  type    = string
  default = "NodePort"
}

variable "cpu_limit" {
  type    = string
  default = "1"
}

variable "memory_limit" {
  type    = string
  default = "512Mi"
}

variable "port_name" {
  type    = string
  default = "http"
}
