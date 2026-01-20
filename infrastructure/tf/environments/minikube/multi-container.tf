module "brute_force" {
  source = "../../modules/backend/multi-container"

  name      = "brute-force"
  namespace = var.namespace

  image = "${var.image_repository}/brute-force:latest"

  labels = {
    app = "brute-force"
  }

  master_container_port = 3030
  master_service_port   = 3030

  worker_replicas = 3
}

module "three_opt" {
  source = "../../modules/backend/multi-container"

  name      = "three-opt"
  namespace = var.namespace

  image = "${var.image_repository}/three-opt:latest"

  labels = {
    app = "three-opt"
  }

  master_container_port = 3040
  master_service_port   = 3040

  worker_replicas = 3
}