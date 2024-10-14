# See the License for the specific language governing permissions and
# limitations under the License.

import synthtool.languages.node as node

node.owlbot_main(templates_excludes=["LICENSE", "README.md", ".github/ISSUE_TEMPLATE", ".github/scripts", ".kokoro", ".github/workflows/issues-no-repro.yaml", ".jsdoc.js"])
