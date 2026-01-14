# Plans Directory

This directory contains versioned implementation plans for the Aria Lite Demo App.

## Versioning Scheme

Plans are named using the format: `plan-v<major>.<minor>-<description>.md`

- **Major version**: Significant architectural changes or major feature additions
- **Minor version**: Incremental updates, refinements, or smaller feature additions
- **Description**: Brief identifier for the plan (e.g., `initial`, `v2-features`, `refactor`)

## Current Plans

- `plan-v1.0-initial.md` - Initial implementation plan for the Aria Lite Demo App

## Adding New Plans

When creating a new plan version:

1. Copy the previous plan as a starting point
2. Update the version number in the filename and frontmatter
3. Update the `date` field in the frontmatter
4. Document what changed from the previous version
5. Update this README to list the new plan

## Plan Frontmatter

Each plan should include frontmatter with:
- `name`: Plan name
- `version`: Version number (e.g., "1.0")
- `date`: Creation date (YYYY-MM-DD)
- `overview`: Brief description
- `todos`: Array of todo items (if any)
