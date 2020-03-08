import {
  SchematicContext,
  Tree,
  SchematicsException,
  Rule
} from '@angular-devkit/schematics';
import { ANGULAR_JSON_FILENAME } from '../../utils/angular-utils';
import { experimental } from '@angular-devkit/core';

export function addTestingSectionToAngularJson(
  workspace: experimental.workspace.WorkspaceSchema,
  projectName: string
): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    updateProjectsTestSection(tree, _context, workspace, projectName);

    return tree;
  };
}

function updateProjectsTestSection(
  tree: Tree,
  _context: SchematicContext,
  workspace: experimental.workspace.WorkspaceSchema,
  projectName: string
) {
  const project = workspace.projects[projectName];

  if (!project?.architect) {
    throw new SchematicsException(`Project ${projectName} not found`);
  }

  project.architect.test = getJestTestingObject(project.root);

  tree.overwrite(ANGULAR_JSON_FILENAME, JSON.stringify(workspace, null, '\t'));
}

function getJestTestingObject(projectRoot: string) {
  return {
    builder: '@nrwl/jest:jest',
    options: {
      jestConfig: `${projectRoot}/jest.config.js`,
      tsConfig: `${projectRoot}/tsconfig.spec.json`,
      passWithNoTests: true,
      setupFile: `${projectRoot}/src/test-setup.ts`
    }
  };
}
