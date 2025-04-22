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
        AWS_CREDENTIALS_ID = 'awd_credentials'
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

        stage('Deploy to S3') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: "${env.AWS_CREDENTIALS_ID}"  // <- 환경변수로 참조
                ]]) {
                    sh '''
                        cd frontend
                        aws s3 sync dist/ s3://$S3_BUCKET/ --delete --region $AWS_REGION
                    '''
                }
            }
        }

        stage('Invalidate CloudFront Cache') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: "${env.AWS_CREDENTIALS_ID}"  // <- 환경변수로 참조
                ]]) {
                    sh '''
                        aws cloudfront create-invalidation \
                        --distribution-id $CLOUDFRONT_DIST_ID \
                        --paths "/*" \
                        --region $AWS_REGION
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning up workspace"
            deleteDir()
        }
    }
}
