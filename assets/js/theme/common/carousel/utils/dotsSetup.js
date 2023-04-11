import updateTextWithLiveData from './updateTextWithLiveData';
import tooltipSetup from './tooltipSetup';

export default ($dots, activeSlideIdx, slidesQuantity, { carouselArrowAndDotAriaLabel, carouselActiveDotAriaLabel }) => {
    if (!$dots) return;

    if (slidesQuantity < 2) {
        $dots.css('display', 'none');
        return;
    }

    $dots.css('display', 'block');

    $dots.children().each((idx, dot) => {
        const dotLabelText = updateTextWithLiveData(carouselArrowAndDotAriaLabel, idx + 1, slidesQuantity);
        const dotSlideStatusText = idx === activeSlideIdx ? `, ${carouselActiveDotAriaLabel}` : '';
        const dotAriaLabel = `${dotLabelText}${dotSlideStatusText}`;
        const $dotButton = $(dot).find('[data-carousel-dot]');

        $(dot).attr('data-index', idx + 1);
        tooltipSetup($dotButton.attr('aria-label', dotAriaLabel));
    });
};
