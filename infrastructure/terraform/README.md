# Terraform Kubernetes Cluster Structure

This directory contains Terraform configuration for deploying a simple Kubernetes cluster setup, including namespaces, backend and frontend services, and ingress, with support for multiple environments (e.g., minikube).

## Structure

- `modules/` - Reusable Terraform modules:
  - `namespace/` - Namespace resources
  - `backend-service/` - Backend deployment and service
  - `frontend/` - Frontend deployment and service
- `environments/` - Environment-specific configuration (e.g., minikube)

## Usage

1. Edit the variables in `environments/minikube/terraform.tfvars` as needed.
2. Run Terraform from the `environments/minikube` directory:
   ```sh
   terraform init
   terraform apply
   ```

## Requirements
- Terraform >= 1.0
- Kubernetes cluster (e.g., minikube) accessible via kubeconfig
