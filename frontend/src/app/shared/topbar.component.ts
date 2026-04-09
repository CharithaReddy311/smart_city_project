import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <div>
        <h2 class="title">{{ title }}</h2>
        <p class="subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <span class="role-badge">{{ role }}</span>
    </header>
  `,
  styles: [`
    .topbar {
      padding: 16px 24px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-card);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .title {
      color: var(--text);
      font-size: 18px;
      font-weight: 700;
    }

    .subtitle {
      color: var(--text3);
      font-size: 12px;
      margin-top: 2px;
    }

    .role-badge {
      border: 1px solid var(--teal);
      color: var(--teal);
      border-radius: 999px;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
  `]
})
export class TopbarComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() role = '';
}
