import {
  Rule,
  SchematicContext,
  Tree,
  SchematicsException
} from '@angular-devkit/schematics';
import {
  ANGULAR_JSON_FILENAME,
  hasTestingSection
} from './utils/angular-utils';
import { experimental } from '@angular-devkit/core';
import {
  updateAngularJson,
  createJestFiles,
  deleteKarmaFiles,
  modifyDependenciesInPackageJson
} from './actions';

export function nxKarmaToJest(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspaceConfig = tree.read(ANGULAR_JSON_FILENAME);

    if (!workspaceConfig) {
      throw new SchematicsException(
        'Could not find Angular workspace configuration'
      );
    }

    const workspaceContent = workspaceConfig.toString();
    const workspace: experimental.workspace.WorkspaceSchema = JSON.parse(
      workspaceContent
    );

    const allProjects = Object.entries(workspace.projects);

    for (let [projectName, project] of allProjects) {
      const projectType = project.projectType === 'application' ? 'app' : 'lib';

      if (!hasTestingSection(project, _context)) {
        _context.logger.debug(
          `${projectName} (${projectType}) has no testing section, skipping...`
        );
        continue;
      }

      updateAngularJson(tree, _context, workspace, projectName);
      createJestFiles(tree, _context, workspace, projectName);
      deleteKarmaFiles(tree, _context, workspace, projectName);
    }

    modifyDependenciesInPackageJson(tree, _context);

    return tree;
  };
}
