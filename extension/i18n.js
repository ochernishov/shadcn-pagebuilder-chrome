export const DEFAULT_LOCALE = "en";
export const LOCALES = [
  { id: "en", label: "EN", name: "English" },
  { id: "ru", label: "RU", name: "Русский" },
  { id: "fr", label: "FR", name: "Français" },
  { id: "it", label: "IT", name: "Italiano" },
  { id: "zh", label: "中文", name: "中文" }
];

const commonTypes = {
  en: ["Hero", "Navigation", "Dashboard", "Application shell", "Data table", "Logos", "Features", "Content", "Steps", "Call to action", "Pricing", "Testimonials", "FAQ", "Footer", "Other"],
  ru: ["Первый экран", "Навигация", "Дашборд", "Каркас приложения", "Таблица данных", "Логотипы", "Преимущества", "Контент", "Этапы", "Призыв к действию", "Тарифы", "Отзывы", "Частые вопросы", "Подвал", "Другое"],
  fr: ["Bannière principale", "Navigation", "Tableau de bord", "Structure d’application", "Tableau de données", "Logos", "Fonctionnalités", "Contenu", "Étapes", "Appel à l’action", "Tarifs", "Témoignages", "FAQ", "Pied de page", "Autre"],
  it: ["Sezione principale", "Navigazione", "Dashboard", "Struttura applicazione", "Tabella dati", "Loghi", "Funzionalità", "Contenuto", "Passaggi", "Invito all’azione", "Prezzi", "Testimonianze", "FAQ", "Piè di pagina", "Altro"],
  zh: ["首屏", "导航", "仪表盘", "应用框架", "数据表", "徽标", "功能", "内容", "步骤", "行动号召", "定价", "用户评价", "常见问题", "页脚", "其他"]
};

const typeKeys = ["hero", "navigation", "dashboard", "applicationShell", "dataTable", "logos", "features", "content", "steps", "cta", "pricing", "testimonials", "faq", "footer", "other"];

const base = {
  en: { designIntent:"DESIGN INTENT",projectSettings:"Project settings",project:"Project",page:"Page",targetRoute:"Target route",newBlock:"NEW BLOCK",sectionType:"Section type",position:"Position",implementationNotes:"Implementation notes",notesPlaceholder:"What should the agent preserve, replace, or remove?",includeScreenshot:"Include screenshot reference",screenshotHint:"Captures the visible block preview for visual models.",screenshotFailed:"Screenshot could not be captured",discard:"Discard",addBlock:"Add block",currentPage:"CURRENT PAGE",emptyHint:"Open a Shadcn Block and capture it.",copyPrompt:"Copy prompt",finishPage:"Finish page",moveUp:"Move up",moveDown:"Move down",removeBlock:"Remove block",blockDiscarded:"Block discarded",discardFailed:"Could not discard block",blockAdded:"Block added",promptCopied:"Prompt copied",saved:"Saved",exportFailed:"Export failed",captureFailed:"Could not capture the block",unknownError:"unknown error",specTitle:"Page Build Specification",source:"Source",visualReference:"Visual reference",install:"Install",changes:"Changes",fallbackChange:"Adapt the source content to the target project.",generalInstructions:"General instructions",generalText:"Follow the existing project's design tokens, typography, colors, containers, responsive conventions, and component architecture. Do not blindly copy demo content. Reuse existing components and assets.",agentInstructions:"Agent implementation instructions",agentSteps:["Inspect the repository before modifying code.","Install selected blocks through the configured registry.","Adapt blocks to the existing design system.","Do not introduce duplicate primitives.","Preserve responsive behavior and accessibility.","Run lint, typecheck, and tests.","Update relevant documentation."],sourceLibrary:"Source library",framework:"Framework"},
  ru: { designIntent:"ЗАМЫСЕЛ СТРАНИЦЫ",projectSettings:"Настройки проекта",project:"Проект",page:"Страница",targetRoute:"Целевой маршрут",newBlock:"НОВЫЙ БЛОК",sectionType:"Тип секции",position:"Позиция",implementationNotes:"Инструкции по реализации",notesPlaceholder:"Что агент должен сохранить, заменить или удалить?",includeScreenshot:"Приложить скриншот",screenshotHint:"Сохранит видимую область блока как ориентир для визуальной модели.",screenshotFailed:"Не удалось сделать скриншот",discard:"Отказаться",addBlock:"Добавить блок",currentPage:"ТЕКУЩАЯ СТРАНИЦА",emptyHint:"Откройте блок Shadcn и добавьте его.",copyPrompt:"Копировать задание",finishPage:"Завершить страницу",moveUp:"Переместить выше",moveDown:"Переместить ниже",removeBlock:"Удалить блок",blockDiscarded:"Блок отклонён",discardFailed:"Не удалось отклонить блок",blockAdded:"Блок добавлен",promptCopied:"Задание скопировано",saved:"Сохранено",exportFailed:"Ошибка экспорта",captureFailed:"Не удалось получить блок",unknownError:"неизвестная ошибка",specTitle:"Спецификация сборки страницы",source:"Источник",visualReference:"Визуальный ориентир",install:"Установка",changes:"Изменения",fallbackChange:"Адаптировать содержимое блока под целевой проект.",generalInstructions:"Общие инструкции",generalText:"Следовать дизайн-токенам, типографике, цветам, контейнерам, адаптивным правилам и архитектуре существующего проекта. Не копировать демонстрационный контент без адаптации. Переиспользовать существующие компоненты и ресурсы.",agentInstructions:"Инструкции агенту",agentSteps:["Изучить репозиторий до внесения изменений.","Установить выбранные блоки через настроенный registry.","Адаптировать блоки к существующей дизайн-системе.","Не создавать дублирующиеся примитивы.","Сохранить адаптивность и доступность.","Запустить lint, typecheck и тесты.","Обновить документацию."],sourceLibrary:"Источник блоков",framework:"Фреймворк"},
  fr: { designIntent:"INTENTION DE DESIGN",projectSettings:"Paramètres du projet",project:"Projet",page:"Page",targetRoute:"Route cible",newBlock:"NOUVEAU BLOC",sectionType:"Type de section",position:"Position",implementationNotes:"Instructions d’implémentation",notesPlaceholder:"Que doit conserver, remplacer ou supprimer l’agent ?",discard:"Ignorer",addBlock:"Ajouter le bloc",currentPage:"PAGE ACTUELLE",emptyHint:"Ouvrez un bloc Shadcn et ajoutez-le.",copyPrompt:"Copier le prompt",finishPage:"Terminer la page",moveUp:"Déplacer vers le haut",moveDown:"Déplacer vers le bas",removeBlock:"Supprimer le bloc",blockDiscarded:"Bloc ignoré",discardFailed:"Impossible d’ignorer le bloc",blockAdded:"Bloc ajouté",promptCopied:"Prompt copié",saved:"Enregistré",exportFailed:"Échec de l’export",captureFailed:"Impossible de capturer le bloc",unknownError:"erreur inconnue",specTitle:"Spécification de construction de page",source:"Source",install:"Installation",changes:"Modifications",fallbackChange:"Adapter le contenu source au projet cible.",generalInstructions:"Instructions générales",generalText:"Respecter les tokens de design, la typographie, les couleurs, les conteneurs, les conventions responsives et l’architecture du projet existant. Ne pas copier aveuglément le contenu de démonstration. Réutiliser les composants et ressources existants.",agentInstructions:"Instructions d’implémentation pour l’agent",agentSteps:["Inspecter le dépôt avant toute modification.","Installer les blocs sélectionnés via le registre configuré.","Adapter les blocs au système de design existant.","Ne pas créer de primitives en double.","Préserver le responsive et l’accessibilité.","Exécuter lint, typecheck et les tests.","Mettre à jour la documentation pertinente."],sourceLibrary:"Bibliothèque source",framework:"Framework"},
  it: { designIntent:"INTENTO DI DESIGN",projectSettings:"Impostazioni progetto",project:"Progetto",page:"Pagina",targetRoute:"Route di destinazione",newBlock:"NUOVO BLOCCO",sectionType:"Tipo di sezione",position:"Posizione",implementationNotes:"Istruzioni di implementazione",notesPlaceholder:"Cosa deve mantenere, sostituire o rimuovere l’agente?",discard:"Scarta",addBlock:"Aggiungi blocco",currentPage:"PAGINA CORRENTE",emptyHint:"Apri un blocco Shadcn e acquisiscilo.",copyPrompt:"Copia prompt",finishPage:"Completa pagina",moveUp:"Sposta in alto",moveDown:"Sposta in basso",removeBlock:"Rimuovi blocco",blockDiscarded:"Blocco scartato",discardFailed:"Impossibile scartare il blocco",blockAdded:"Blocco aggiunto",promptCopied:"Prompt copiato",saved:"Salvato",exportFailed:"Esportazione non riuscita",captureFailed:"Impossibile acquisire il blocco",unknownError:"errore sconosciuto",specTitle:"Specifica di costruzione della pagina",source:"Fonte",install:"Installazione",changes:"Modifiche",fallbackChange:"Adattare il contenuto sorgente al progetto di destinazione.",generalInstructions:"Istruzioni generali",generalText:"Seguire i design token, la tipografia, i colori, i contenitori, le convenzioni responsive e l’architettura del progetto esistente. Non copiare alla cieca il contenuto demo. Riutilizzare componenti e risorse esistenti.",agentInstructions:"Istruzioni di implementazione per l’agente",agentSteps:["Esaminare il repository prima di apportare modifiche.","Installare i blocchi selezionati tramite il registry configurato.","Adattare i blocchi al design system esistente.","Non introdurre primitive duplicate.","Mantenere responsive design e accessibilità.","Eseguire lint, typecheck e test.","Aggiornare la documentazione pertinente."],sourceLibrary:"Libreria sorgente",framework:"Framework"},
  zh: { designIntent:"页面设计意图",projectSettings:"项目设置",project:"项目",page:"页面",targetRoute:"目标路由",newBlock:"新模块",sectionType:"模块类型",position:"位置",implementationNotes:"实现说明",notesPlaceholder:"智能体应保留、替换或删除哪些内容？",discard:"放弃",addBlock:"添加模块",currentPage:"当前页面",emptyHint:"打开一个 Shadcn 模块并采集它。",copyPrompt:"复制提示词",finishPage:"完成页面",moveUp:"上移",moveDown:"下移",removeBlock:"删除模块",blockDiscarded:"已放弃模块",discardFailed:"无法放弃模块",blockAdded:"模块已添加",promptCopied:"提示词已复制",saved:"已保存",exportFailed:"导出失败",captureFailed:"无法采集模块",unknownError:"未知错误",specTitle:"页面构建规范",source:"来源",install:"安装",changes:"修改要求",fallbackChange:"根据目标项目调整源内容。",generalInstructions:"通用说明",generalText:"遵循现有项目的设计令牌、排版、颜色、容器、响应式规范和组件架构。不要直接照搬演示内容。尽可能复用现有组件和资源。",agentInstructions:"智能体实现说明",agentSteps:["修改代码前先检查仓库。","通过已配置的 registry 安装所选模块。","让模块适配现有设计系统。","不要引入重复的基础组件。","保持响应式行为和可访问性。","运行 lint、typecheck 和测试。","更新相关文档。"],sourceLibrary:"模块来源",framework:"框架"}
};

Object.assign(base.fr, { includeScreenshot: "Joindre une capture d’écran", screenshotHint: "Capture l’aperçu visible comme référence visuelle.", screenshotFailed: "Impossible de capturer l’écran", visualReference: "Référence visuelle" });
Object.assign(base.it, { includeScreenshot: "Allega screenshot", screenshotHint: "Cattura l’anteprima visibile come riferimento visivo.", screenshotFailed: "Impossibile acquisire lo screenshot", visualReference: "Riferimento visivo" });
Object.assign(base.zh, { includeScreenshot: "附加截图", screenshotHint: "保存当前可见预览，供视觉模型参考。", screenshotFailed: "无法截取屏幕", visualReference: "视觉参考" });
Object.assign(base.en, { savedPages: "Saved pages", newProject: "+ Project", newPage: "+ Page", projectNamePrompt: "New project name", pageNamePrompt: "New page name" });
Object.assign(base.ru, { savedPages: "Сохранённые страницы", newProject: "+ Проект", newPage: "+ Страница", projectNamePrompt: "Название нового проекта", pageNamePrompt: "Название новой страницы" });
Object.assign(base.fr, { savedPages: "Pages enregistrées", newProject: "+ Projet", newPage: "+ Page", projectNamePrompt: "Nom du nouveau projet", pageNamePrompt: "Nom de la nouvelle page" });
Object.assign(base.it, { savedPages: "Pagine salvate", newProject: "+ Progetto", newPage: "+ Pagina", projectNamePrompt: "Nome del nuovo progetto", pageNamePrompt: "Nome della nuova pagina" });
Object.assign(base.zh, { savedPages: "已保存页面", newProject: "+ 项目", newPage: "+ 页面", projectNamePrompt: "新项目名称", pageNamePrompt: "新页面名称" });
Object.assign(base.en, { projectFolder: "Project folder", chooseFolder: "Choose folder", noFolder: "No folder selected", pageMode: "Page task", createPage: "Create", editPage: "Edit", alreadyAdded: "This block is already in the current page", openSource: "Open source", registryLabel: "Registry", installCommandLabel: "Install command", notesLabel: "Notes", screenshotIncluded: "Screenshot included", chooseFolderFailed: "Could not choose project folder" });
Object.assign(base.ru, { projectFolder: "Папка проекта", chooseFolder: "Выбрать папку", noFolder: "Папка не выбрана", pageMode: "Задача страницы", createPage: "Создать", editPage: "Редактировать", alreadyAdded: "Этот блок уже добавлен в текущую страницу", openSource: "Открыть источник", registryLabel: "Registry", installCommandLabel: "Команда установки", notesLabel: "Заметки", screenshotIncluded: "Скриншот приложен", chooseFolderFailed: "Не удалось выбрать папку проекта" });
Object.assign(base.fr, { projectFolder: "Dossier du projet", chooseFolder: "Choisir le dossier", noFolder: "Aucun dossier sélectionné", pageMode: "Tâche de page", createPage: "Créer", editPage: "Modifier", alreadyAdded: "Ce bloc est déjà dans la page actuelle", openSource: "Ouvrir la source", registryLabel: "Registry", installCommandLabel: "Commande d’installation", notesLabel: "Notes", screenshotIncluded: "Capture incluse", chooseFolderFailed: "Impossible de choisir le dossier du projet" });
Object.assign(base.it, { projectFolder: "Cartella progetto", chooseFolder: "Scegli cartella", noFolder: "Nessuna cartella selezionata", pageMode: "Attività pagina", createPage: "Crea", editPage: "Modifica", alreadyAdded: "Questo blocco è già nella pagina corrente", openSource: "Apri sorgente", registryLabel: "Registry", installCommandLabel: "Comando di installazione", notesLabel: "Note", screenshotIncluded: "Screenshot incluso", chooseFolderFailed: "Impossibile scegliere la cartella del progetto" });
Object.assign(base.zh, { projectFolder: "项目文件夹", chooseFolder: "选择文件夹", noFolder: "未选择文件夹", pageMode: "页面任务", createPage: "创建", editPage: "编辑", alreadyAdded: "当前页面已包含此模块", openSource: "打开来源", registryLabel: "Registry", installCommandLabel: "安装命令", notesLabel: "备注", screenshotIncluded: "已附加截图", chooseFolderFailed: "无法选择项目文件夹" });

Object.assign(base.en, {
  addScreenshot: "Add screenshot", addCurrentPage: "Add current page", currentPageCaptured: "Current page ready to add", visualReferenceItem: "Visual reference", capturedText: "Captured text",
  visualReferenceFallback: "Recreate this section from the screenshot as an original implementation that fits the target project. Determine layout, behavior, responsive states, and accessible interactions from the visible reference.",
  screenshotPreviewAlt: "Captured visual reference", selectRegionStatus: "Select an area on the page", regionSelectionHint: "Drag to select the reference area", regionSelectionCancel: "Esc — cancel",
  regionSelectionCanceled: "Screenshot canceled", visualReferenceAdded: "Visual reference added", regionCaptureFailed: "Could not capture the selected area",
  emptyHint: "Capture a source page or add a screenshot reference.",
  agentSteps: ["Inspect the repository before modifying code.", "Review every source URL, screenshot, and captured note.", "Use an official install command only when it is available and authorized in the user's environment.", "When source access is unavailable, create an original implementation from the visible reference without bypassing access controls or copying proprietary code.", "Adapt every item to the existing design system and avoid duplicate primitives.", "Preserve responsive behavior and accessibility.", "Run lint, typecheck, and tests, then update relevant documentation."]
});
Object.assign(base.ru, {
  addScreenshot: "Добавить скриншот", addCurrentPage: "Добавить текущую страницу", currentPageCaptured: "Текущая страница готова к добавлению", visualReferenceItem: "Визуальный референс", capturedText: "Сохранённый текст",
  visualReferenceFallback: "Самостоятельно воссоздать секцию по скриншоту и адаптировать её к целевому проекту. Определить по видимому референсу композицию, поведение, адаптивные состояния и доступные взаимодействия.",
  screenshotPreviewAlt: "Сохранённый визуальный референс", selectRegionStatus: "Выделите область на странице", regionSelectionHint: "Протяните рамку вокруг нужной области", regionSelectionCancel: "Esc — отменить",
  regionSelectionCanceled: "Скриншот отменён", visualReferenceAdded: "Визуальный референс добавлен", regionCaptureFailed: "Не удалось снять выбранную область",
  emptyHint: "Добавьте страницу-источник или снимок произвольной области.",
  agentSteps: ["Изучить репозиторий до внесения изменений.", "Проверить каждую ссылку, скриншот и сохранённую заметку.", "Использовать официальную команду установки только при наличии разрешённого доступа в окружении пользователя.", "Если исходник недоступен, создать оригинальную реализацию по видимому референсу, не обходя ограничения доступа и не копируя закрытый код.", "Адаптировать каждый элемент к существующей дизайн-системе и не создавать дублирующиеся примитивы.", "Сохранить адаптивность и доступность.", "Запустить lint, typecheck и тесты, затем обновить документацию."]
});
Object.assign(base.fr, {
  addScreenshot: "Ajouter une capture", addCurrentPage: "Ajouter la page actuelle", currentPageCaptured: "Page actuelle prête à être ajoutée", visualReferenceItem: "Référence visuelle", capturedText: "Texte capturé",
  visualReferenceFallback: "Recréer cette section à partir de la capture avec une implémentation originale adaptée au projet cible. Déduire la mise en page, le comportement, le responsive et les interactions accessibles.",
  screenshotPreviewAlt: "Référence visuelle capturée", selectRegionStatus: "Sélectionnez une zone de la page", regionSelectionHint: "Faites glisser pour sélectionner la zone de référence", regionSelectionCancel: "Échap — annuler",
  regionSelectionCanceled: "Capture annulée", visualReferenceAdded: "Référence visuelle ajoutée", regionCaptureFailed: "Impossible de capturer la zone sélectionnée",
  emptyHint: "Capturez une page source ou ajoutez une référence visuelle.",
  agentSteps: ["Inspecter le dépôt avant toute modification.", "Examiner chaque URL, capture et note enregistrée.", "N’utiliser une commande d’installation officielle que si l’environnement de l’utilisateur y est autorisé.", "Si la source est inaccessible, créer une implémentation originale à partir de la référence visible sans contourner les contrôles d’accès ni copier du code propriétaire.", "Adapter chaque élément au système de design existant sans dupliquer les primitives.", "Préserver le responsive et l’accessibilité.", "Exécuter lint, typecheck et les tests, puis mettre à jour la documentation."]
});
Object.assign(base.it, {
  addScreenshot: "Aggiungi screenshot", addCurrentPage: "Aggiungi pagina corrente", currentPageCaptured: "Pagina corrente pronta per essere aggiunta", visualReferenceItem: "Riferimento visivo", capturedText: "Testo acquisito",
  visualReferenceFallback: "Ricreare la sezione dallo screenshot con un’implementazione originale adatta al progetto. Dedurre layout, comportamento, stati responsive e interazioni accessibili.",
  screenshotPreviewAlt: "Riferimento visivo acquisito", selectRegionStatus: "Seleziona un’area della pagina", regionSelectionHint: "Trascina per selezionare l’area di riferimento", regionSelectionCancel: "Esc — annulla",
  regionSelectionCanceled: "Screenshot annullato", visualReferenceAdded: "Riferimento visivo aggiunto", regionCaptureFailed: "Impossibile acquisire l’area selezionata",
  emptyHint: "Acquisisci una pagina sorgente o aggiungi un riferimento visivo.",
  agentSteps: ["Esaminare il repository prima delle modifiche.", "Controllare ogni URL, screenshot e nota acquisita.", "Usare un comando di installazione ufficiale solo quando l’ambiente dell’utente dispone dell’accesso autorizzato.", "Se il sorgente non è disponibile, creare un’implementazione originale dal riferimento visibile senza aggirare i controlli di accesso o copiare codice proprietario.", "Adattare ogni elemento al design system esistente senza duplicare primitive.", "Mantenere responsive design e accessibilità.", "Eseguire lint, typecheck e test, quindi aggiornare la documentazione."]
});
Object.assign(base.zh, {
  addScreenshot: "添加截图", addCurrentPage: "添加当前页面", currentPageCaptured: "当前页面已准备添加", visualReferenceItem: "视觉参考", capturedText: "采集的文本",
  visualReferenceFallback: "根据截图创建适合目标项目的原创实现，并从可见参考中推断布局、行为、响应式状态和无障碍交互。",
  screenshotPreviewAlt: "已采集的视觉参考", selectRegionStatus: "请在页面上选择区域", regionSelectionHint: "拖动以选择参考区域", regionSelectionCancel: "Esc — 取消",
  regionSelectionCanceled: "已取消截图", visualReferenceAdded: "已添加视觉参考", regionCaptureFailed: "无法截取所选区域",
  emptyHint: "采集来源页面或添加截图参考。",
  agentSteps: ["修改代码前先检查仓库。", "检查每个来源链接、截图和采集备注。", "仅在用户环境具有授权访问时使用官方安装命令。", "无法访问源代码时，根据可见参考创建原创实现，不绕过访问控制，也不复制专有代码。", "让每个项目适配现有设计系统，并避免重复基础组件。", "保持响应式行为和可访问性。", "运行 lint、类型检查和测试，然后更新相关文档。"]
});

Object.assign(base.en, { collectorReady: "Collector package ready", copyNumber: "Copy number", numberCopied: "Collector number copied", defaultProjectName: "My Website", defaultPageName: "Landing Page", languageSwitcher: "Interface language", contextMenuTitle: "Add to Shadcn Page Collector", noActiveWebPage: "No active web page", siteAccessRequired: "Allow website access to capture the current page", expandProjectSettings: "Expand project settings", collapseProjectSettings: "Collapse project settings" });
Object.assign(base.ru, { collectorReady: "Пакет Collector готов", copyNumber: "Копировать номер", numberCopied: "Номер Collector скопирован", defaultProjectName: "Мой сайт", defaultPageName: "Лендинг", languageSwitcher: "Язык интерфейса", contextMenuTitle: "Добавить в Shadcn Page Collector", noActiveWebPage: "Нет активной веб-страницы", siteAccessRequired: "Разрешите доступ к сайтам, чтобы захватывать текущую страницу", expandProjectSettings: "Развернуть настройки проекта", collapseProjectSettings: "Свернуть настройки проекта" });
Object.assign(base.fr, { collectorReady: "Paquet Collector prêt", copyNumber: "Copier le numéro", numberCopied: "Numéro Collector copié", defaultProjectName: "Mon site", defaultPageName: "Page d’accueil", languageSwitcher: "Langue de l’interface", contextMenuTitle: "Ajouter à Shadcn Page Collector", noActiveWebPage: "Aucune page web active", siteAccessRequired: "Autorisez l’accès aux sites pour capturer la page actuelle", expandProjectSettings: "Développer les paramètres du projet", collapseProjectSettings: "Réduire les paramètres du projet" });
Object.assign(base.it, { collectorReady: "Pacchetto Collector pronto", copyNumber: "Copia numero", numberCopied: "Numero Collector copiato", defaultProjectName: "Il mio sito", defaultPageName: "Pagina di destinazione", languageSwitcher: "Lingua dell’interfaccia", contextMenuTitle: "Aggiungi a Shadcn Page Collector", noActiveWebPage: "Nessuna pagina web attiva", siteAccessRequired: "Consenti l’accesso ai siti per acquisire la pagina corrente", expandProjectSettings: "Espandi impostazioni progetto", collapseProjectSettings: "Comprimi impostazioni progetto" });
Object.assign(base.zh, { collectorReady: "Collector 包已就绪", copyNumber: "复制编号", numberCopied: "已复制 Collector 编号", defaultProjectName: "我的网站", defaultPageName: "落地页", languageSwitcher: "界面语言", contextMenuTitle: "添加到 Shadcn Page Collector", noActiveWebPage: "没有活动的网页", siteAccessRequired: "请允许访问网站以截取当前页面", expandProjectSettings: "展开项目设置", collapseProjectSettings: "收起项目设置" });

Object.assign(base.en, {
  workflowMode: "Collection mode", pageWorkflow: "Page", singleWorkflow: "One block", singleDesignIntent: "BLOCK INTENT", singleBlock: "ONE BLOCK",
  singleEmptyTitle: "Capture a block without changing your page", singleEmptyHint: "Open any component or block, capture the current page, prepare the reference, and paste it directly into a coding agent.",
  captureSingleBlock: "Capture current block", singleReady: "READY TO COPY", clearSingle: "Clear", copySingle: "Copy for agent", prepareSingle: "Prepare block",
  singlePrepared: "Block ready to copy", singleCopied: "Block task copied", singleCopiedWithScreenshot: "Block task and screenshot copied",
  singleAgentTask: "Implement or replace one UI block in the current project using this reference.",
  singleAccessPolicy: "Use an official installer only when the user's environment is authorized. Otherwise create an original implementation from the visible reference without bypassing access controls or copying proprietary code.",
  saveNotes: "Save notes", notesSaved: "Implementation notes saved", notesSaveFailed: "Could not save implementation notes"
});
Object.assign(base.ru, {
  workflowMode: "Режим сбора", pageWorkflow: "Страница", singleWorkflow: "Один блок", singleDesignIntent: "ЗАМЫСЕЛ БЛОКА", singleBlock: "ОДИН БЛОК",
  singleEmptyTitle: "Возьмите один блок, не меняя собранную страницу", singleEmptyHint: "Откройте любой компонент или блок, захватите текущую страницу, подготовьте референс и вставьте его прямо в задание для агента.",
  captureSingleBlock: "Захватить текущий блок", singleReady: "ГОТОВО К КОПИРОВАНИЮ", clearSingle: "Очистить", copySingle: "Копировать для агента", prepareSingle: "Подготовить блок",
  singlePrepared: "Блок готов к копированию", singleCopied: "Задание для блока скопировано", singleCopiedWithScreenshot: "Задание и скриншот блока скопированы",
  singleAgentTask: "Реализовать или заменить один UI-блок в текущем проекте по этому референсу.",
  singleAccessPolicy: "Использовать официальный установщик только при наличии разрешённого доступа в окружении пользователя. Иначе создать оригинальную реализацию по видимому референсу, не обходя ограничения доступа и не копируя закрытый код.",
  saveNotes: "Сохранить описание", notesSaved: "Описание реализации сохранено", notesSaveFailed: "Не удалось сохранить описание реализации"
});
Object.assign(base.fr, {
  workflowMode: "Mode de collecte", pageWorkflow: "Page", singleWorkflow: "Un bloc", singleDesignIntent: "INTENTION DU BLOC", singleBlock: "UN BLOC",
  singleEmptyTitle: "Capturez un bloc sans modifier la page collectée", singleEmptyHint: "Ouvrez un composant ou un bloc, capturez la page actuelle, préparez la référence et collez-la directement dans un agent de codage.",
  captureSingleBlock: "Capturer le bloc actuel", singleReady: "PRÊT À COPIER", clearSingle: "Effacer", copySingle: "Copier pour l’agent", prepareSingle: "Préparer le bloc",
  singlePrepared: "Bloc prêt à copier", singleCopied: "Tâche du bloc copiée", singleCopiedWithScreenshot: "Tâche et capture du bloc copiées",
  singleAgentTask: "Implémenter ou remplacer un seul bloc d’interface dans le projet actuel à partir de cette référence.",
  singleAccessPolicy: "Utiliser l’installateur officiel uniquement si l’environnement de l’utilisateur dispose d’un accès autorisé. Sinon, créer une implémentation originale à partir de la référence visible sans contourner les contrôles d’accès ni copier de code propriétaire.",
  saveNotes: "Enregistrer la description", notesSaved: "Description d’implémentation enregistrée", notesSaveFailed: "Impossible d’enregistrer la description d’implémentation"
});
Object.assign(base.it, {
  workflowMode: "Modalità raccolta", pageWorkflow: "Pagina", singleWorkflow: "Un blocco", singleDesignIntent: "INTENTO DEL BLOCCO", singleBlock: "UN BLOCCO",
  singleEmptyTitle: "Acquisisci un blocco senza modificare la pagina raccolta", singleEmptyHint: "Apri un componente o un blocco, acquisisci la pagina corrente, prepara il riferimento e incollalo direttamente in un agente di programmazione.",
  captureSingleBlock: "Acquisisci il blocco corrente", singleReady: "PRONTO DA COPIARE", clearSingle: "Cancella", copySingle: "Copia per l’agente", prepareSingle: "Prepara blocco",
  singlePrepared: "Blocco pronto da copiare", singleCopied: "Attività del blocco copiata", singleCopiedWithScreenshot: "Attività e screenshot del blocco copiati",
  singleAgentTask: "Implementare o sostituire un singolo blocco UI nel progetto corrente usando questo riferimento.",
  singleAccessPolicy: "Usare il programma di installazione ufficiale solo quando l’ambiente dell’utente dispone di accesso autorizzato. Altrimenti creare un’implementazione originale dal riferimento visibile senza aggirare i controlli di accesso o copiare codice proprietario.",
  saveNotes: "Salva descrizione", notesSaved: "Descrizione di implementazione salvata", notesSaveFailed: "Impossibile salvare la descrizione di implementazione"
});
Object.assign(base.zh, {
  workflowMode: "采集模式", pageWorkflow: "页面", singleWorkflow: "单个区块", singleDesignIntent: "区块意图", singleBlock: "单个区块",
  singleEmptyTitle: "采集一个区块而不修改已收集的页面", singleEmptyHint: "打开任意组件或区块，采集当前页面，整理参考信息，然后直接粘贴给编程代理。",
  captureSingleBlock: "采集当前区块", singleReady: "可复制", clearSingle: "清除", copySingle: "复制给代理", prepareSingle: "准备区块",
  singlePrepared: "区块已可复制", singleCopied: "已复制区块任务", singleCopiedWithScreenshot: "已复制区块任务和截图",
  singleAgentTask: "使用此参考在当前项目中实现或替换一个 UI 区块。",
  singleAccessPolicy: "仅当用户环境具有授权访问权限时使用官方安装程序。否则，应根据可见参考创建原创实现，不得绕过访问控制或复制专有代码。",
  saveNotes: "保存说明", notesSaved: "已保存实现说明", notesSaveFailed: "无法保存实现说明"
});

export const MESSAGES = Object.fromEntries(Object.entries(base).map(([locale, messages]) => [locale, { ...messages, types: Object.fromEntries(typeKeys.map((key, index) => [key, commonTypes[locale][index]])) }]));
export function translate(locale, key) { return MESSAGES[locale]?.[key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key; }

const LEGACY_SYSTEM_LABELS = {
  defaultProjectName: ["My Website", "Мой сайт"],
  defaultPageName: ["Landing Page", "Лендинг", "Лендинг-страница"]
};

function systemLabelValues(key, configuredValue = "") {
  return new Set([
    ...Object.values(MESSAGES).map(messages => messages[key]),
    ...LEGACY_SYSTEM_LABELS[key],
    configuredValue
  ].map(value => String(value || "").trim()).filter(Boolean));
}

export function localizeSystemLabels(spec, locale = DEFAULT_LOCALE) {
  if (spec.projectLabelKey) spec.project = translate(locale, spec.projectLabelKey);
  if (spec.pageLabelKey) spec.page = translate(locale, spec.pageLabelKey);
  return spec;
}

export function migrateSystemLabels(spec, locale = DEFAULT_LOCALE, configuredDefaults = {}) {
  if (!spec.projectDirectory && !spec.projectLabelKey && systemLabelValues("defaultProjectName", configuredDefaults.project).has(String(spec.project || "").trim())) {
    spec.projectLabelKey = "defaultProjectName";
  }
  if (!spec.pageLabelKey && systemLabelValues("defaultPageName", configuredDefaults.page).has(String(spec.page || "").trim())) {
    spec.pageLabelKey = "defaultPageName";
  }
  return localizeSystemLabels(spec, locale);
}
