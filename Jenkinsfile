pipeline {
  agent {
    kubernetes {
      label 'docker'
      defaultContainer 'jnlp'
      serviceAccount 'helm'
      yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: dockernpm
    image: gcr.io/cidc-dfci/docker-node:latest
    command:
    - cat
    tty: true
    volumeMounts:
    - mountPath: /var/run/docker.sock
      name: docker-volume
  - name: gcloud
    image: gcr.io/cidc-dfci/gcloud-helm:latest
    command:
    - cat
    tty: true
  volumes:
  - name: docker-volume
    hostPath: 
      path: /var/run/docker.sock
"""
    }
  }
  environment {
      GOOGLE_APPLICATION_CREDENTIALS = credentials('google-service-account')
      CODECOV_TOKEN = credentials('front-end-codecov-token')
      CA_CERT_PEM = credentials("ca.cert.pem")
      HELM_CERT_PEM = credentials("helm.cert.pem")
      HELM_KEY_PEM = credentials("helm.key.pem")
  }
  stages {
    stage('Checkout SCM') {
      steps {
        container('dockernpm') {
          checkout scm
          sh 'npm install'
        }
      }
    }
    stage("Run Jest Tests") {
        steps {
            container('dockernpm') {
                sh 'npm run test-cover'
                sh 'curl -s https://codecov.io/bash | bash -s - -t ${CODECOV_TOKEN}'
            }
        }
    }
    stage("Docker build") {
        steps {
            container('dockernpm') {
                // load the appropriate configuration into the .env file
                sh '([[ $GIT_BRANCH = staging ]] && cp .env.staging .env) || :'
                sh '([[ $GIT_BRANCH = prod ]] && cp .env.prod .env) || :'
                
                sh 'npm run build'

                dir('build') {
                    sh 'docker build -t nginx-website -f ../nginx/Dockerfile .'
                }
            }
        }
    }
    stage('Docker login') {
      steps {
        container('dockernpm') {
          sh 'cat ${GOOGLE_APPLICATION_CREDENTIALS} | docker login -u _json_key --password-stdin https://gcr.io'
        }
      }
    }
    stage("Docker push (staging)") {
        when {
            branch 'staging'
        }
        steps {
            container('dockernpm') {
                sh 'docker tag nginx-website gcr.io/cidc-dfci/nginx-website:staging'
                sh 'docker push gcr.io/cidc-dfci/nginx-website:staging'
            }
        }
    }
    stage("Docker push (master)") {
        when {
            branch 'master'
        }
        steps {
            container('dockernpm') {
                sh 'docker tag nginx-website gcr.io/cidc-dfci/nginx-website:production'
                sh 'docker push gcr.io/cidc-dfci/nginx-website:production'
            }
        }
    }
    stage('Deploy (staging)') {
      when {
        branch 'staging'
      }
      steps {
        container('gcloud') {
          sh 'gcloud container clusters get-credentials cidc-cluster-staging --zone us-east1-c --project cidc-dfci'
          sh 'helm init --client-only'
          sh 'cat ${CA_CERT_PEM} > $(helm home)/ca.pem'
          sh 'cat ${HELM_CERT_PEM} > $(helm home)/cert.pem'
          sh 'cat ${HELM_KEY_PEM} > $(helm home)/key.pem'
          sh 'helm repo add cidc "http://${CIDC_CHARTMUSEUM_SERVICE_HOST}:${CIDC_CHARTMUSEUM_SERVICE_PORT}" '
          sh 'sleep 10'
          sh 'helm upgrade nginx cidc/nginx --version=0.1.0-staging --set imageSHA=$(gcloud container images list-tags --format="get(digest)" --filter="tags:staging" gcr.io/cidc-dfci/nginx-website) --set image.tag=staging --tls'
          sh 'sleep 10'
          sh "kubectl wait pod -l app.kubernetes.io/name=nginx --for=condition=Ready --timeout=180s"
        }
      }
    }
  }
}
