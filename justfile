website := env_var('HOME') / 'projects/shimmermathlabs/website'

# Build, copy, and publish the single-file.
default: deploy

# Start the browser's development server.
dev:
    npm run dev

# Build dist/index.html.
build:
    npm run build

# Copy the built page into the website's public directory.
copy: build
    cp dist/index.html "{{website}}/public/flowers.html"

# Build the website, then deploy only if the build succeeds.
deploy: copy
    cd "{{website}}" && npm run build && npm run deploy
