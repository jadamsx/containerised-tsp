resource "kubernetes_deployment" "server" {
  metadata {
    name      = var.name
    namespace = var.namespace
    labels    = var.labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = var.labels
    }

    template {
      metadata {
        labels = var.labels
      }

      spec {
        container {
          name  = var.name
          image = var.image

          image_pull_policy = "Always"

          resources {
            limits = {
              cpu    = var.cpu_limit
              memory = var.memory_limit
            }
          }

          port {
            name           = var.port_name
            container_port = var.container_port
            protocol       = "TCP"
          }
        }
      }
    }
  }
}