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
  const cardId = `linkcard-${Math.random().toString(36).slice(2, 11)}`

  return (
    <>
      <a
        id={cardId}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        class="flex my-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors no-underline overflow-hidden min-h-20"
      >
        <div class="flex-1 p-2 min-w-0 flex flex-col justify-center overflow-hidden">
          {hasMetadata ? (
            <>
              <div class="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight mb-1 flex items-center gap-1 truncate">
                {favicon && <img src={favicon} alt="" class="w-4 h-4 flex-shrink-0" />}
                <span class="truncate">{title || displayDomain}</span>
              </div>
              {description && (
                <div class="text-xs text-gray-600 dark:text-gray-400 leading-tight mb-1 line-clamp-2">
                  {description}
                </div>
              )}
              <div class="text-xs text-gray-500 dark:text-gray-500 truncate">
                {displayDomain}
              </div>
            </>
          ) : (
            <>
              <div class="metadata-loading">
                <div class="animate-pulse">
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-4/5"></div>
                  <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-3/5"></div>
                  <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/5"></div>
                </div>
              </div>
              <div class="metadata-content" style="display: none;">
                <div class="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight mb-1 flex items-center gap-1 truncate">
                  <img class="favicon-img w-4 h-4 flex-shrink-0" alt="" style="display: none;" />
                  <span class="title-span truncate">Loading...</span>
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400 leading-tight mb-1 description-text line-clamp-2"></div>
                <div class="text-xs text-gray-500 dark:text-gray-500 domain-text truncate">
                  {displayDomain}
                </div>
              </div>
            </>
          )}
        </div>
        <div class="flex-shrink-0 image-container">
          {image ? (
            <img src={image} alt="" class="max-h-16 max-w-24 object-contain" />
          ) : (
            <img alt="" class="max-h-16 max-w-24 object-contain og-image" style="display: none;" />
          )}
        </div>
      </a>
      {!hasMetadata && (
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const card = document.getElementById('${cardId}');
              if (!card) return;

              fetch('/api/metadata?url=' + encodeURIComponent('${url}'))
                .then(res => res.json())
                .then(data => {
                  const loading = card.querySelector('.metadata-loading');
                  const content = card.querySelector('.metadata-content');
                  const titleSpan = card.querySelector('.title-span');
                  const descEl = card.querySelector('.description-text');
                  const domainEl = card.querySelector('.domain-text');
                  const ogImage = card.querySelector('.og-image');
                  const faviconImg = card.querySelector('.favicon-img');

                  if (loading) loading.style.display = 'none';
                  if (content) content.style.display = 'block';

                  if (titleSpan) titleSpan.textContent = data.title || '${displayDomain}';
                  if (descEl && data.description) {
                    descEl.textContent = data.description;
                    descEl.style.display = 'block';
                  }
                  if (domainEl) domainEl.textContent = data.domain || '${displayDomain}';
                  if (faviconImg && data.favicon) {
                    faviconImg.src = data.favicon;
                    faviconImg.style.display = 'inline-block';
                  }
                  if (ogImage && data.image) {
                    ogImage.src = data.image;
                    ogImage.onload = () => { ogImage.style.display = 'block'; };
                    ogImage.onerror = () => { ogImage.style.display = 'none'; };
                  }
                })
                .catch(() => {
                  const loading = card.querySelector('.metadata-loading');
                  const content = card.querySelector('.metadata-content');
                  const titleSpan = card.querySelector('.title-span');
                  const domainEl = card.querySelector('.domain-text');
                  if (loading) loading.style.display = 'none';
                  if (content) content.style.display = 'block';
                  if (titleSpan) titleSpan.textContent = '${displayDomain}';
                  if (domainEl) domainEl.textContent = '${displayDomain}';
                });
            })();
          `
        }} />
      )}
    </>
  )
}
