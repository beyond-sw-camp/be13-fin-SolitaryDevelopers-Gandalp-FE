pipeline {
    agent {
        kubernetes {
            yaml '''
            apiVersion: v1
            kind: Pod
            metadata:
              name: vue3-deploy-agent
            spec:
              containers:
              - name: node
                image: node:20-alpine
                command:
                - cat
                tty: true
              - name: awscli
                image: amazon/aws-cli
                command:
                - cat
                tty: true
            '''
        }
    }

    environment {
        AWS_REGION = 'ap-northeast-2'
        S3_BUCKET = 'gandalp-s3'
        CLOUDFRONT_DIST_ID = 'E1JTO3ZBAXZFKE'
        AWS_CREDENTIALS_ID = 'ec2-access-key'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop', credentialsId: 'github-token', url: 'git@github.com:beyond-sw-camp/be13-fin-2team-2.git'
            }
        }

        stage('Vue3 Build') {
            steps {
                container('node') {
                    sh '''
                        cd frontend
                        npm install
                        npm run build
                    '''
                }
            }
        }

        stage('Deploy to S3') {
            steps {
                container('awscli') {
                    withCredentials([[ 
                        $class: 'AmazonWebServicesCredentialsBinding', 
                        credentialsId: "${AWS_CREDENTIALS_ID}" 
                    ]]) {
                        sh '''
                            cd frontend
                            aws s3 sync dist/ s3://$S3_BUCKET/ --delete --region $AWS_REGION
                        '''
                    }
                }
            }
        }

        stage('Invalidate CloudFront Cache') {
            steps {
                container('awscli') {
                    withCredentials([[ 
                        $class: 'AmazonWebServicesCredentialsBinding', 
                        credentialsId: "${AWS_CREDENTIALS_ID}" 
                    ]]) {
                        sh '''
                            aws cloudfront create-invalidation \
                              --distribution-id $CLOUDFRONT_DIST_ID \
                              --paths "/*"
                        '''
                    }
                }
            }
        }
    }
}
