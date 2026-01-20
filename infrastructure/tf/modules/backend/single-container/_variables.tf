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

variable "container_port" {
  type = number
}

variable "service_port" {
  type = number
}

variable "service_type" {
  type    = string
  default = "ClusterIP"
}

variable "port_name" {
  type    = string
  default = "http"
}

variable "replicas" {
  type    = number
  default = 1
}

variable "cpu_limit" {
  type    = string
  default = "1"
}

variable "memory_limit" {
  type    = string
  default = "512Mi"
}