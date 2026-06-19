import { defineConfig } from 'prisma/config'
export default defineConfig({
  datasource: {
    url: "postgresql://postgres:aryan@localhost:5432/docusign_db"
  }
})