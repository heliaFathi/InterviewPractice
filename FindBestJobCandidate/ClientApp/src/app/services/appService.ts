import { Injectable, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, map, retry } from 'rxjs/operators';
import { of } from "rxjs";


@Injectable()
export class AppService {

  constructor(private http: HttpClient, @Inject('BASE_URL')private baseUrl: string) {
  }

  getJobs() {
    return this.http.get<Job[]>(this.baseUrl + 'api/Home')
      .pipe(
        map((res: any) => {
          return res;
        }),
        //retry(3), // Retry up to 3 times before failing

        catchError(error => of([]))
      );
  }

  getCandidates() {
    return this.http.get<Candidate[]>("http://private-76432-jobadder1.apiary-mock.com/candidates")
      .pipe(
        catchError(error => of({error: true}))
      );
  }
}
