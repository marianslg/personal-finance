import express from 'express'
import cors from 'cors'
import expressJSDocSwagger from 'express-jsdoc-swagger'
import currencyRoutes from '../../routes/currencyRoutes'
import accountRoutes from '../../routes/accountRoutes'
import instrumentRoutes from '../../routes/instrumentRoutes'
import snapshotRoutes from '../../routes/snapshotRoutes'
import prisma from '../../lib/prisma'

const app = express()
app.use(cors())
app.use(express.json())

// Auto-generate OpenAPI from JSDoc
expressJSDocSwagger(app)({
	info: {
		version: '0.1.0',
		title: 'Personal Finance API',
		description: 'API para gestionar monedas, cuentas, instrumentos y snapshots',
	},
	baseDir: process.cwd(),
	filesPattern: ['src/controllers/**/*.ts', 'src/routes/**/*.ts'],
	swaggerUIPath: '/api/docs',
	exposeApiDocs: true,
	apiDocsPath: '/api/docs.json',
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/currencies', currencyRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/instruments', instrumentRoutes)
app.use('/api/snapshots', snapshotRoutes)

process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0) })
process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0) })

const port = Number(process.env.PORT || 3001)
app.listen(port, () => console.log(`API server listening on http://localhost:${port} - docs: http://localhost:${port}/api/docs`))
