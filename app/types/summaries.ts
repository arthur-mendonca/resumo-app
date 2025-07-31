export interface Summary {
  id: string;
  category: string;
  summary: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  originalUrl: string;
  subcategory: string;
}
