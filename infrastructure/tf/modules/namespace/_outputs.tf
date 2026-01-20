output "namespace" {
  description = "Name of the Kubernetes namespace created by this module."
  value       = kubernetes_namespace.this.metadata[0].name
}