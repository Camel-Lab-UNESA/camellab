import { createError, defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import { getRawFile } from '~~/server/utils/github'
import { IMAGE_TYPES, UPLOAD_DIR } from '~~/server/utils/uploads'

// Uploads go live as static files with the next deploy. Until then the request falls through to
// here, so the editor and the new post can show the image straight from the repo.
export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name') ?? ''
  const type = IMAGE_TYPES[name.split('.').pop() ?? '']
  if (!type || !/^[\w-]+\.\w+$/.test(name)) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const data = await getRawFile(`${UPLOAD_DIR}/${name}`)
  setResponseHeaders(event, {
    'content-type': type,
    'cache-control': 'public, max-age=60',
    'x-content-type-options': 'nosniff'
  })
  return data
})
