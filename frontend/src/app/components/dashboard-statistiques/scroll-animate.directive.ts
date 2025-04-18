import { Directive, ElementRef, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appScrollAnimate]'
})
export class ScrollAnimateDirective implements OnInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.addClass(this.el.nativeElement, 'visible');
          observer.unobserve(this.el.nativeElement);
        }
      });
    }, {
      threshold: 0.1
    });

    this.renderer.addClass(this.el.nativeElement, 'scroll-animate');
    observer.observe(this.el.nativeElement);
  }
}
