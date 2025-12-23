interface LinkCardProps {
  url: string
  title?: string
  description?: string
  image?: string
  favicon?: string
  domain?: string
}

export function LinkCard({ url, title, description, image, favicon, domain }: LinkCardProps) {
  const displayDomain = domain || new URL(url).hostname

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      class="block my-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors no-underline"
    >
      <div class="flex gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            {favicon && (
              <img src={favicon} alt="" class="w-4 h-4 flex-shrink-0" />
            )}
            <span class="text-sm text-gray-600 dark:text-gray-400 truncate">
              {displayDomain}
            </span>
          </div>
          {title && (
            <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
              {title}
            </h3>
          )}
          {description && (
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {description}
            </p>
          )}
        </div>
        {image && (
          <div class="flex-shrink-0">
            <img 
              src={image} 
              alt="" 
              class="w-20 h-20 object-cover rounded"
            />
          </div>
        )}
      </div>
    </a>
  )
}
