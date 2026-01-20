output "master_service_name" {
  description = "Name of the Kubernetes Service resource for the master component."
  value       = kubernetes_service.master.metadata[0].name
}

output "master_deployment_name" {
  description = "Name of the Kubernetes Deployment resource for the master component."
  value       = kubernetes_deployment.master.metadata[0].name
}

output "worker_deployment_name" {
  description = "Name of the Kubernetes Deployment resource for the worker component."
  value       = kubernetes_deployment.worker.metadata[0].name
}
