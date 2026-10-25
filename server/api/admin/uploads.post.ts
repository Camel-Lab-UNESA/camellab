import { randomUUID } from 'node:crypto'
import { createError, defineEventHandler, getHeader, readMultipartFormData } from 'h3'
import { requireInternal } from '~~/server/utils/admin'
import { putFile } from '~~/server/utils/github'
import { imageExtension, MAX_UPLOAD_BYTES, UPLOAD_DIR } from '~~/server/utils/uploads'

const tooLarge = () => createError({ statusCode: 413, statusMessage: 'Images must be 4 MB or smaller' })

export default defineEventHandler(async (event) => {
  await requireInternal(event)
  // Room for the multipart wrapping around the file.
  if (Number(getHeader(event, 'content-length')) > MAX_UPLOAD_BYTES + 64 * 1024) throw tooLarge()

  const file = (await readMultipartFormData(event))?.find(part => part.name === 'file')
  if (!file?.data.length) throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  if (file.data.length > MAX_UPLOAD_BYTES) throw tooLarge()

  const ext = imageExtension(file.data)
  if (!ext) throw createError({ statusCode: 400, statusMessage: 'Upload a PNG, JPEG, GIF or WebP image' })

  const name = `${randomUUID()}.${ext}`
  await putFile(`${UPLOAD_DIR}/${name}`, file.data, `content: upload image ${name}`)
  return { url: `/uploads/${name}` }
})
