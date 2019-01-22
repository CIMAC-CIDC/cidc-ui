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
  - name: node
    image: node:10.14.0-jessie
    command:
    - cat
    tty: true
"""
    }
  }
  environment {
      GOOGLE_APPLICATION_CREDENTIALS = credentials('google-service-account')
      CODECOV_TOKEN = credentials('front-end-codecov-token')
  }
  stages {
    stage('Checkout SCM') {
      steps {
        container('node') {
          checkout scm
          sh 'npm install'
        }
      }
    }
    stage("Run Jest Tests") {
        steps {
            container('node') {
                sh 'npm run test-cover'
                sh 'curl -s https://codecov.io/bash | bash -s - -t ${CODECOV_TOKEN}'
            }
        }
    }
    stage("Build bundle") {
        steps {
            container('node') {
                sh 'npm run build'
            }
        }
    }
    // stage("Remove hashes and deploy (master)") {
    //     when {
    //         branch 'master'
    //     }
    //     steps {
    //         container('node') {
    //             sh 'bash google-deploy.sh'
    //         }
    //     }
    // }
  }
}
