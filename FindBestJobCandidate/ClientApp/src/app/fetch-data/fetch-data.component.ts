import { Component, OnInit  } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AppService } from '../services/appService';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent implements OnInit {
  skills = {}; // contains set of all seen skills across jobs and candidates
  skillArray = [] // sorted array of all unique skills across jobs and candidates
  jobToSkillSet = {}; // for a jobId, contains a record of skills and their order
  candidateToSkillSet = {}; // for a candidateId, contains a record of skills and their order
  jobToFeature = {}; // maps jobId to feature vector for the job
  candidateToFeature = {}; // maps candidateId to feature vector for the candidate
  jobs: Job[];
  selectedJobDesc: string;
  candidates: Candidate[];
  bestCandidate: Candidate;
  errorMessage: any;

  constructor(private service: AppService) {
  }

  ngOnInit() {

    forkJoin([this.service.getJobs(), this.service.getCandidates()])
      .subscribe(
        (response: any) => {

          let jobList = response[0];
          let candidateList = response[1];

          if (jobList == null || jobList.length == 0 ) {
            this.errorMessage = 'error happened getting jobs.';
            return;
          }

          this.fetchAllJobs(jobList);

          if (candidateList.error) {
            this.errorMessage = 'error happened getting candidates.';
            return;
          }

          this.fetchAllCandidates(candidateList);
          
          this.buildFeatureVectors();
        });
  }

  onChange(selectedJobId) {
    let selectedJob = this.jobs.find(j => j.jobId + "" === selectedJobId);

    this.selectedJobDesc = selectedJob.skills;

    this.onQueryBestCandidate(selectedJobId);
  }

  fetchAllJobs(data) {
      this.jobs = data;

      //making some initial data structures
      for (let job of data) {
        this.jobToSkillSet[job.jobId] = {};
        let skillArray = job.skills.split(",");
        let ind = 0;
        for (let skill of skillArray) {
          let _skill = skill.trim().toLowerCase();
          // record that we saw this skill
          this.skills[_skill] = true;
          // record order of this skill in the corresponding job description
          this.jobToSkillSet[job.jobId][_skill] = ind++;
        }
      }

      console.log("fetched job data.");
  };

  fetchAllCandidates(data) {
      this.candidates = data;

      // making some initial data structures
      for (let candidate of data) {
        this.candidateToSkillSet[candidate.candidateId] = {};
        let skillArray = candidate.skillTags.split(",");
        let ind = 0;
        for (let skill of skillArray) {
          let _skill = skill.trim().toLowerCase();
          // record that we saw this skill
          this.skills[_skill] = true;
          // record order of this skill in the corresponding job description
          this.candidateToSkillSet[candidate.candidateId][_skill] = ind++;
        }
      }

      console.log("fetched candidate data.");
  };

  buildFeatureVectors() {
    this.skillArray = Object.keys(this.skills)
    this.skillArray.sort(); // sort skills alphabetically
    console.log("Problem dimension (m) is ", this.skillArray.length);
    // computing job feature vectors
    for (let jobId in this.jobToSkillSet) {
      this.jobToFeature[jobId] = this.computeJobFeatureVector(jobId);
    }

    console.log("Computed job feature vectors.");

    // computing candidate feature vectors
    for (let candidateId in this.candidateToSkillSet) {
      this.candidateToFeature[candidateId] = this.computeCandidateFeatureVector(candidateId);
    }

    console.log("Computed candidate feature vectors.");
}

  computeZeroWeight(m) {
    return m * (m - 1) * (m - 1);
  };

  computeJobFeatureVector(jobId) {
    // assumes skillArray is initialized
    let m = this.skillArray.length;
    let skills = this.jobToSkillSet[jobId];
    return this.skillArray.map(skill => {
      if (skill in skills) {
        return m - skills[skill]; // the lower the index, the closer to max confidence m
      } else {
        return this.computeZeroWeight(m); // some big number depending on m
      }
    });
  };

  computeCandidateFeatureVector(candidateId) {
    // assumes skillArray is initialized
    let m = this.skillArray.length;
    let skills = this.candidateToSkillSet[candidateId];
    return this.skillArray.map(skill => {
      if (skill in skills) {
        return m - skills[skill]; // the lower the index, the closer to max confidence m
      } else {
        return this.computeZeroWeight(m); // some big number depending on m
      }
    });
  };

  getBestCandidateForJob(jobId) {
  let jobFeatureVec = this.jobToFeature[jobId];
  // need to find the closest candidate to jobFeatureVec
  let minDist = Infinity;
  let diff = 0;
  let selectedCandidate;
  for (let candidateId in this.candidateToFeature) {
    diff = this.dist(jobFeatureVec, this.candidateToFeature[candidateId]);
    if (diff < minDist) {
      selectedCandidate = candidateId;
      minDist = diff;
    }
  }
  return selectedCandidate;
  };

  dist(a, b) {
  // assuming a and b are two arrays with the same dimension
  // returns euclidean distance between the two
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
};

  onQueryBestCandidate(selectedJobId) {
    if (selectedJobId) {
      let candidateId = this.getBestCandidateForJob(selectedJobId);
      this.bestCandidate = this.candidates.find(c => c.candidateId + "" === candidateId);
    }
  }
}
