module "nearest_neighbour" {
  source = "../../modules/backend/single-container"

  name      = "nearest-neighbour"
  namespace = var.namespace

  image = "${var.image_repository}/nearest-neighbour:latest"

  labels = {
    app = "nearest-neighbour"
  }

  container_port = 3000
  service_port   = 3000
}

module "cheapest_insertion" {
  source = "../../modules/backend/single-container"

  name      = "cheapest-insertion"
  namespace = var.namespace

  image = "${var.image_repository}/cheapest-insertion:latest"

  labels = {
    app = "cheapest-insertion"
  }

  container_port = 3010
  service_port   = 3010
}

module "dynamic_programming" {
  source = "../../modules/backend/single-container"

  name      = "dynamic-programming"
  namespace = var.namespace

  image = "${var.image_repository}/dynamic-programming:latest"

  labels = {
    app = "dynamic-programming"
  }

  container_port = 3020
  service_port   = 3020
}

