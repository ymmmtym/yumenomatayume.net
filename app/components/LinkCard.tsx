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
  const hasMetadata = title || description || image
  const cardId = hasMetadata ? undefined : `linkcard-${Math.random().toString(36).substr(2, 9)}`

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      class="flex my-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors no-underline overflow-hidden min-h-20"
    >
      <div class="flex-1 p-2 min-w-0 flex flex-col justify-center overflow-hidden">
        <div class="flex items-center gap-1 mb-0.5">
          {favicon && (
            <img 
              src={favicon} 
              alt="" 
              class="w-4 h-4 flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <div class="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight truncate title-text">
            {title || displayDomain}
          </div>
        </div>
        {description && (
          <div class="text-xs text-gray-600 dark:text-gray-400 leading-tight mb-1 line-clamp-2">
            {description}
          </div>
        )}
        <div class="text-xs text-gray-500 dark:text-gray-500 truncate">
          {displayDomain}
        </div>
      </div>
      {image && (
        <div class="flex-shrink-0">
          <img 
            src={image} 
            alt="" 
            class="max-h-16 max-w-24 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}
    </a>
  )
}
