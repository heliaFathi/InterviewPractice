using System.Text.Json.Serialization;
using System.Collections.Generic;
using System.Linq;

namespace Application.Dtos
{
    public class JobDto
    {
        [JsonPropertyName("jobId")]
        public int JobId { get; set; }
        [JsonPropertyName("name")]
        public string Name { get; set; }
        [JsonPropertyName("company")]
        public string Company { get; set; }
        [JsonPropertyName("skills")]
        public string Skills { get; set; }
        public Dictionary<int, string> SkillList
        {
            get
            {
                return CalculateWeights();
            }
        }
        private Dictionary<int, string> CalculateWeights()
        {
            var skillList = new List<string>(Skills.Split(new char[] { ',' }))
                            .Select(c => c.ToLower().Trim()).Distinct().ToList();

            var dic = new Dictionary<int, string>();

            for (int i = 0; i < skillList.Count; i++)
            {
                dic.Add(skillList.Count - i, skillList[i]);
            }

            return dic;
        }
    }
}
