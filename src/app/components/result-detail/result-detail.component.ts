import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ResultService } from '../../services/result.service';
import { Result } from '../../models/result.model';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';

@Component({
  selector: 'app-result-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusLabelPipe],
  templateUrl: './result-detail.component.html'
})
export class ResultDetailComponent implements OnInit {

  result: Result | null = null;
  loading = true;
  errorMessage = '';

  constructor(private route: ActivatedRoute, private resultService: ResultService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.load(id);
    });
  }

  private load(id: number): void {
    this.loading = true;

    this.resultService.getResultById(id).subscribe({
      next: (result) => {
        this.result = result;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Result not found.';
        this.loading = false;
      }
    });
  }
}
