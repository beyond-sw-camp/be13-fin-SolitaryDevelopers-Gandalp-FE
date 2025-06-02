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
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop', credentialsId: 'github-token', url: 'git@github.com:beyond-sw-camp/be13-fin-SolitaryDevelopers-Gandalp-FE.git'
            }
        }

        stage('Vue3 Build') {
            steps {
                script {
                    def status = sh(script: 'npm install', returnStatus: true)
                    if (status != 0) {
                        error("npm install failed")
                    }
                    sh 'npm run build'
                    sh 'ls -al dist'
                }
            }
        }

        stage('Deploy to S3') {
            steps {
                sh '''
                # ✅ 1️⃣ 전체 dist 폴더를 먼저 S3에 싱크
                aws s3 sync dist/ s3://$S3_BUCKET/ --delete --region $AWS_REGION

                # ✅ 2️⃣ JS 파일에 MIME 타입 강제 지정
                find dist -name "*.js" | while read filepath; do
                    relative_path=${filepath#dist/}
                    aws s3 cp "$filepath" "s3://$S3_BUCKET/$relative_path" \
                    --region $AWS_REGION \
                    --content-type "application/javascript" \
                    --metadata-directive REPLACE
                done

                # ✅ 3️⃣ CSS 파일도 마찬가지
                find dist -name "*.css" | while read filepath; do
                    relative_path=${filepath#dist/}
                    aws s3 cp "$filepath" "s3://$S3_BUCKET/$relative_path" \
                    --region $AWS_REGION \
                    --content-type "text/css" \
                    --metadata-directive REPLACE
                done
                '''
            }
            }

        stage('Invalidate CloudFront Cache') {
            steps {
                // IAM Role이 EC2에서 자동으로 인증을 처리하므로 credentialsId 제거
                sh '''
                    aws cloudfront create-invalidation \
                    --distribution-id $CLOUDFRONT_DIST_ID \
                    --paths "/*" \
                    --region $AWS_REGION
                '''
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
