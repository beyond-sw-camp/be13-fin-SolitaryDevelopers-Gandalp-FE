pipeline {
    agent {
        docker {
            image 'my-node-app'
        }
    }

    environment {
        AWS_REGION = 'ap-northeast-2'
        S3_BUCKET = 'gandalp-s3'
        CLOUDFRONT_DIST_ID = 'E1JTO3ZBAXZFKE'
        AWS_CREDENTIALS_ID = 'aws-credentials'  // <- 환경 변수로 자격 증명 ID 등록
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop', credentialsId: 'github-token', url: 'git@github.com:beyond-sw-camp/be13-fin-2team-2.git'
            }
        }

        stage('Vue3 Build') {
            steps {
                script {
                    def status = sh(script: 'cd frontend && npm install', returnStatus: true)
                    if (status != 0) {
                        error("npm install failed")
                    }
                    sh 'cd frontend && npm run build'
                }
            }
        }

        stage('
