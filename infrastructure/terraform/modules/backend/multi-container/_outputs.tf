output "master_service_name" {
  value = kubernetes_service.master.metadata[0].name
}

output "master_deployment_name" {
  value = kubernetes_deployment.master.metadata[0].name
}

output "worker_deployment_name" {
  value = kubernetes_deployment.worker.metadata[0].name
}
