resource "kubernetes_service" "master" {
  metadata {
    name      = "${var.name}-master"
    namespace = var.namespace
  }

  spec {
    selector = var.labels

    port {
      port        = var.master_service_port
      target_port = var.port_name
      protocol    = "TCP"
    }

    type = var.service_type
  }
}
