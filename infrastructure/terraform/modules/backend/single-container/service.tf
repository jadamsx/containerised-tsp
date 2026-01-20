resource "kubernetes_service" "service" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  spec {
    selector = var.labels

    port {
      port        = var.service_port
      target_port = var.port_name
      protocol    = "TCP"
    }

    type = var.service_type
  }
}
