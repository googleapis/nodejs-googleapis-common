# See the License for the specific language governing permissions and
# limitations under the License.
import synthtool as s
import synthtool.gcp as gcp
import synthtool.languages.node as node
import logging

logging.basicConfig(level=logging.DEBUG)

common_templates = gcp.CommonTemplates()
templates = common_templates.node_library()
s.copy(sources=templates, excludes=["LICENSE", "README.md", ".github/ISSUE_TEMPLATE", ".github/scripts", ".kokoro", ".github/workflows/issues-no-repro.yaml", ".jsdoc.js"])
