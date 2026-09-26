import intro from "./intro";
import variables from "./variables";
import operators from "./operators";
import strings from "./strings";
import conditions from "./conditions";
import loops from "./loops";
import listsTuples from "./lists-tuples";
import dictsSets from "./dicts-sets";
import functions from "./functions";
import comprehensionsLambda from "./comprehensions-lambda";
import errors from "./errors";
import files from "./files";
import modules from "./modules";
import oopBasics from "./oop-basics";
import oopAdvanced from "./oop-advanced";
import iteratorsGenerators from "./iterators-generators";
import decorators from "./decorators";
import pythonic from "./pythonic";
import type { Section } from "../types";

export const sections: Section[] = [
  intro,
  variables,
  operators,
  strings,
  conditions,
  loops,
  listsTuples,
  dictsSets,
  functions,
  comprehensionsLambda,
  errors,
  files,
  modules,
  oopBasics,
  oopAdvanced,
  iteratorsGenerators,
  decorators,
  pythonic,
].sort((a, b) => a.order - b.order);

export const getSection = (slug: string) => sections.find((s) => s.slug === slug);

export const groups = Array.from(new Set(sections.map((s) => s.group)));
