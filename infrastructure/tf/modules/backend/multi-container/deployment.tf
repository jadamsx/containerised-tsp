resource "kubernetes_deployment" "master" {
  metadata {
    name      = "${var.name}-master"
    namespace = var.namespace
    labels    = var.labels
  }

  spec {
    replicas = 1

    selector {
      match_labels = var.labels
    }

    template {
      metadata {
        labels = var.labels
      }

      spec {
        container {
          name  = "${var.name}-master"
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
            container_port = var.master_container_port
            protocol       = "TCP"
          }
        }
      }
    }
  }
}

resource "kubernetes_deployment" "worker" {
  metadata {
    name      = "${var.name}-worker"
    namespace = var.namespace
    labels    = var.labels
  }

  spec {
    replicas = var.worker_replicas

    selector {
      match_labels = var.labels
    }

    template {
      metadata {
        labels = var.labels
      }

      spec {
        container {
          name  = "${var.name}-worker"
          image = var.image
          image_pull_policy = "Always"

          env {
            name  = "NODE_ENV"
            value = "worker"
          }

          resources {
            limits = {
              cpu    = var.cpu_limit
              memory = var.memory_limit
            }
          }
        }
      }
    }
  }
}
