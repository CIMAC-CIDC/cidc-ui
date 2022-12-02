# Changelog

This Changelog tracks changes to this project. The notes below include a summary for each release, followed by details which contain one or more of the following tags:

- `added` for new features.
- `changed` for functionality and API changes.
- `deprecated` for soon-to-be removed features.
- `removed` for now removed features.
- `fixed` for any bug fixes.
- `security` in case of vulnerabilities.

## 02 Dec 2022

- `changed` updated google-github-actions/setup-gcloud version to be pinned to v0

## 01 Dec 2022

- `changed` updated looker studio link to cimac account owned version

## 31 Oct 2022

- `changed` updated README

## 27 Oct 2022

- `removed` analysis for ctdna

## 25 Oct 2022

- `added` N/A organization for users

## 17 Oct 2022

- `changed` Data Exploration > Code-based View, update for new templates and permissions scheme
- `fixed` bug in pipelines docs pointing to chips instead of atacseq
- `changed` Data Exploration links to open in new tab

## 14 Sep 2022

- `changed` template download button to point to /templates/assays not /templates/metadata

## 11 Aug 2022

- `changed` clinical data NOT included in cross-assay permissions

## 27 Jul 2022

- `added` Windows batch download command

## 22 Jul 2022

- `fixed` allowed cimac-biofx-user to see transfer data tab

## 11 Jul 2022

- `fixed` corrected timezone for file time uploaded

## 29 Jun 2022

- `fixed` loading for manifest upload

## 17 Jun 2022

- `changed` width of data exploration cards
- `changed` "Data Exploration" content update

## 16 Jun 2022

- `added` "Data Exploration" tab
- `added` tooltip to show file short_description in File Browser


## 15 Jun 2022

- `removed` transfer assays tab
- `removed` 'new' chip on tranfer data header tab

## 13 Jun 2022

- `changed` related files call to use IApiPage to correctly pull files out of response _items

## 9 Jun 2022

- `added` ctDNA to list of assays with analyses

## 20 May 2022

- `changed` reverted previous "wes" -> "wes_normal" and "wes_tumor_only" -> "wes_tumor"
- `changed` link location from just the text to whole chip
- `added` links to the clinical data chips
  - api already changed to return under clinical_participants

## 19 May 2022

- `changed` WES display on data-overview to compensate for the changes in counting in the API
  - `changed` "wes" -> "wes_normal" and "wes_tumor_only" -> "wes_tumor"
- `added` links from data-overview to browse-data, with appropriate trial_id and facet params
  - uses new /downloable_files/facet_groups_for_links in the API which was added for this purpose
