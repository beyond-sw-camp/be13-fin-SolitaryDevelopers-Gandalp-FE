pipeline {
    agent {
        docker {
            image 'my-node-app'
        }
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop', credentialsId: 'github-token', url: 'git@github.com:beyond-sw-camp/be13-fin-2team-2.git'
            }
        }

        stage('Vue3 Build') {
            steps {
                sh '''
                    cd frontend
                    npm install
                    npm run build
                '''
            }
        }

        stage('Deploy to S3') {
            steps {
                sh '''
                    cd frontend
                    aws s3 sync dist/ s3://$S3_BUCKET/ --delete --region $AWS_REGION
                '''
            }
        }

        stage('Invalidate CloudFront Cache') {
            steps {
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
