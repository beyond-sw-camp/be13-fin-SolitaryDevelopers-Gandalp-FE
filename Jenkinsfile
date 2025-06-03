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
                echo "📦 S3에 dist 폴더 전체 업로드"
                aws s3 sync dist/ s3://$S3_BUCKET/ --delete --region $AWS_REGION

                echo "🛠️ 전체 dist 하위의 JS 파일 MIME 타입 재설정"
                find dist -type f -name "*.js" | while read filepath; do
                    # dist/ 경로를 기준으로 상대 경로 추출
                    relative_path="${filepath#dist/}"

                    echo "⏳ 업로드 중: $relative_path"

                    aws s3 cp "$filepath" "s3://$S3_BUCKET/$relative_path" \
                        --content-type "application/javascript" \
                        --metadata-directive REPLACE \
                        --region $AWS_REGION
                done
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

    post {
        always {
            echo "🧹 Cleaning up workspace"
            deleteDir()
        }
    }
}
