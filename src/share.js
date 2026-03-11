// Powers of Pig - Share System
// Web Share API and share card generation

const ShareSystem = {
    // Check if Web Share API is available
    canNativeShare() {
        return navigator.share !== undefined;
    },

    // Check if can share files (not just text)
    canShareFiles() {
        if (!navigator.canShare) return false;
        const testFile = new File(['test'], 'test.png', { type: 'image/png' });
        return navigator.canShare({ files: [testFile] });
    },

    // Generate share image using html2canvas
    async captureShareCard(shareCardEl) {
        if (typeof html2canvas === 'undefined') {
            console.warn('html2canvas not loaded');
            return null;
        }

        try {
            // html2canvas can capture off-screen elements directly
            const canvas = await html2canvas(shareCardEl, {
                backgroundColor: null,
                scale: 2, // Higher quality
                useCORS: true,
                allowTaint: true,
                logging: false
            });

            return new Promise((resolve) => {
                canvas.toBlob(resolve, 'image/png');
            });
        } catch (e) {
            console.warn('Could not capture share card:', e);
            return null;
        }
    },

    // Share with Web Share API (native)
    async nativeShare(text, blob = null) {
        const shareData = { text };

        if (blob && this.canShareFiles()) {
            shareData.files = [new File([blob], 'powers-of-pig.png', { type: 'image/png' })];
        }

        try {
            await navigator.share(shareData);
            return 'completed';
        } catch (e) {
            if (e.name === 'AbortError') {
                return 'cancelled';
            }
            throw e;
        }
    },

    // Fallback: copy text to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    }
};

// Export for Node/test compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShareSystem };
}
