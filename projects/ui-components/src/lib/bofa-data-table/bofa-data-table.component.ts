import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

export interface BofaTableColumn {
  key: string;
  header: string;
  format?: 'currency' | 'date' | 'text';
}

// Generic row type — downstream consumers provide their own typed data
export type TableRowData = Record<string, unknown>;

@Component({
  selector: 'bofa-data-table',
  templateUrl: './bofa-data-table.component.html',
})
export class BofaDataTableComponent implements OnChanges {
  @Input() rows: TableRowData[] = [];
  @Input() columns: BofaTableColumn[] = [];
  @Input() isLoading = false;
  @Input() emptyMessage = 'No records found.';
  @Input() stickyHeader = true;

  tableDataSource = new MatTableDataSource<TableRowData>([]);

  get displayedColumns(): string[] {
    return this.columns.map(c => c.key);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows']) {
      this.tableDataSource.data = this.rows;
    }
  }

  getCellValue(row: TableRowData, column: BofaTableColumn): string {
    const value = row[column.key];
    if (value === null || value === undefined) return '—';
    if (column.format === 'currency' && typeof value === 'number') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
    if (column.format === 'date' && typeof value === 'string') {
      return new Date(value).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    }
    return String(value);
  }
}
