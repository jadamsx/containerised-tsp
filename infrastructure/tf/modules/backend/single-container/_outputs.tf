output "service_name" {
  description = "Name of the Kubernetes Service created by this module."
  value       = kubernetes_service.service.metadata[0].name
}

output "deployment_name" {
  description = "Name of the Kubernetes Deployment created by this module."
  value       = kubernetes_deployment.server.metadata[0].name
}